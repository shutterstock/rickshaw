#!/usr/bin/env perl

use warnings;
use strict;

use Time::Local 'timegm';

my @header;
my $data;

while (<>) {

	# the third line is the header
	if ($. == 3) {
		          # and we want the years in epoch seconds
		@header = map { m/^(\d{4})/; year_to_seconds($1); }
	              (split ',')[1..11];
	}

	if (m/^(Northeast|Midwest|South|West)/) {
		my $i = -1;
		$data .= "\n{\n\tname: \"$1\",\n";
		$data .= "\tdata: [ " . join(", ", map { "{ x: $header[++$i], y: $_ }" } (split ',')[1..11]) . " ],\n\n},";
	}

	chop $data && last  if  m/^Alabama/; # we have what we need now.
}

sub year_to_seconds {
	my $year = shift;
	return timegm(0, 0, 0, 1, 0, $year);
}

print "$data\n";
